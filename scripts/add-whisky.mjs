#!/usr/bin/env node
/**
 * 위스키 추가 파이프라인
 *
 * 이미지 1장 + 한글 이름만 주면:
 *   1. 배경 제거 (누끼) — rembg 설치 시 자동, 없으면 건너뜀
 *   2. 리사이즈(최대 800px) + WebP 압축
 *   3. Supabase Storage `whiskies` 버킷 업로드
 *   4. Claude API 웹서치로 주류 정보 자동 리서치 (도수/지역/증류소/캐스크/국내 가격대)
 *   5. whiskies 테이블 upsert
 *
 * 사용법:
 *   node scripts/add-whisky.mjs <이미지경로> --name "아벨라워 아부나흐" [옵션]
 *
 * 옵션:
 *   --name <한글이름>   필수. DB의 name 컬럼 (예: "아벨라워 아부나흐")
 *   --id <slug>         생략 시 리서치 결과의 영문명으로 자동 생성 (예: aberlour-abunadh)
 *   --no-cutout         배경 제거 건너뛰기 (이미 누끼 딴 이미지일 때)
 *   --no-research       리서치 건너뛰기 (--abv 등 수동 입력과 함께 사용)
 *   --abv / --region / --distillery / --cask / --price   수동 메타 입력
 *   --dry-run           업로드/DB 반영 없이 결과만 출력
 *
 * 환경변수 (.env.local에서 자동 로드):
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  — 업로드/DB 필수
 *   ANTHROPIC_API_KEY                                     — 자동 리서치에 필요
 *
 * 사전 준비 (1회):
 *   배경 제거를 쓰려면: pip3 install rembg[cli] onnxruntime
 */

import { readFileSync, existsSync, writeFileSync, unlinkSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { resolve, join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'
import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// ---------- .env.local 로드 ----------
function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    const p = join(ROOT, file)
    if (!existsSync(p)) continue
    for (const line of readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
    }
  }
}
loadEnv()

// ---------- 인자 파싱 ----------
const args = process.argv.slice(2)
const imagePath = args.find(a => !a.startsWith('--'))
const flag = name => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : undefined
}
const has = name => args.includes(`--${name}`)

if (!imagePath || !flag('name')) {
  console.error('사용법: node scripts/add-whisky.mjs <이미지경로> --name "한글이름" [--id slug] [--dry-run]')
  process.exit(1)
}

const nameKo = flag('name')
const dryRun = has('dry-run')

// ---------- 1. 배경 제거 ----------
async function removeBackground(inputPath) {
  if (has('no-cutout')) {
    console.log('· 배경 제거: 건너뜀 (--no-cutout)')
    return readFileSync(inputPath)
  }
  try {
    execFileSync('rembg', ['--help'], { stdio: 'ignore' })
  } catch {
    console.log('· 배경 제거: rembg 미설치 → 건너뜀  (설치: pip3 install "rembg[cli]" onnxruntime)')
    return readFileSync(inputPath)
  }
  const out = join(tmpdir(), `maltlog-cutout-${Date.now()}.png`)
  console.log('· 배경 제거 중... (첫 실행은 모델 다운로드로 1~2분 걸릴 수 있음)')
  execFileSync('rembg', ['i', inputPath, out], { stdio: 'inherit' })
  const buf = readFileSync(out)
  unlinkSync(out)
  console.log('· 배경 제거 완료')
  return buf
}

// ---------- 2. 리사이즈 + WebP ----------
async function processImage(buffer) {
  const out = await sharp(buffer)
    .trim()                                    // 투명 여백 제거
    .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 88 })
    .toBuffer()
  console.log(`· 이미지 처리 완료: ${(out.length / 1024).toFixed(0)}KB (webp)`)
  return out
}

// ---------- 3. Claude 리서치 ----------
async function researchWhisky(name) {
  if (has('no-research')) return null
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.log('· 리서치: ANTHROPIC_API_KEY 없음 → 건너뜀 (수동 플래그 사용)')
    return null
  }
  console.log('· Claude 웹서치로 주류 정보 리서치 중...')
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-8',
      max_tokens: 2000,
      thinking: { type: 'adaptive' },
      tools: [{ type: 'web_search_20260209', name: 'web_search' }],
      messages: [{
        role: 'user',
        content: `위스키 "${name}"에 대해 웹서치로 조사하고, 마지막에 아래 형식의 JSON 코드블록 하나만 출력해.

\`\`\`json
{
  "slug": "영문 소문자-하이픈 슬러그 (예: aberlour-abunadh)",
  "name_en": "공식 영문명",
  "distillery": "증류소 한글명",
  "region": "지역 — 다음 형식 중 하나: 스코틀랜드 (스페이사이드), 스코틀랜드 (하이랜드), 스코틀랜드 (아일라), 스코틀랜드 (로우랜드), 스코틀랜드 (캠벨타운), 스코틀랜드 (아일랜즈), 아일랜드, 일본, 미국 (켄터키), 미국 (테네시), 대만, 한국, 캐나다, 인도",
  "abv": "도수 (예: 43.0% — 캐스크 스트렝스로 배치마다 다르면 대표값에 '내외' 표기)",
  "cask": "캐스크 종류 한글 (예: 올로로소 셰리 캐스크)",
  "price": "한국 시중 가격대 (예: 12-15만원 — 모르면 null)"
}
\`\`\`

사실만 적고, 확실하지 않은 필드는 null로 둬.`,
      }],
    }),
  })
  if (!res.ok) {
    console.error(`· 리서치 실패: HTTP ${res.status} — ${(await res.text()).slice(0, 200)}`)
    return null
  }
  const data = await res.json()
  const text = data.content.filter(b => b.type === 'text').map(b => b.text).join('\n')
  const m = text.match(/```json\s*([\s\S]*?)```/)
  if (!m) {
    console.error('· 리서치 응답에서 JSON을 찾지 못함:\n', text.slice(0, 300))
    return null
  }
  const info = JSON.parse(m[1])
  console.log('· 리서치 완료:', JSON.stringify(info, null, 2))
  return info
}

// ---------- 4+5. 업로드 + DB ----------
async function main() {
  const inputPath = resolve(imagePath)
  if (!existsSync(inputPath)) {
    console.error(`이미지 파일 없음: ${inputPath}`)
    process.exit(1)
  }

  const [cutout, info] = await Promise.all([
    removeBackground(inputPath).then(processImage),
    researchWhisky(nameKo),
  ])

  const slug = flag('id') || info?.slug
  if (!slug) {
    console.error('slug를 알 수 없음 — --id 플래그를 주거나 리서치를 활성화하세요')
    process.exit(1)
  }

  const fileName = `${slug}.webp`
  const row = {
    id: slug,
    name: nameKo,
    image: fileName,
    distillery: flag('distillery') ?? info?.distillery ?? null,
    region: flag('region') ?? info?.region ?? null,
    abv: flag('abv') ?? info?.abv ?? null,
    cask: flag('cask') ?? info?.cask ?? null,
    price: flag('price') ?? info?.price ?? null,
  }

  console.log('\n=== 등록 내용 ===')
  console.table([row])

  if (dryRun) {
    const preview = join(ROOT, `dry-run-${fileName}`)
    writeFileSync(preview, cutout)
    console.log(`(dry-run) 업로드 생략 — 처리된 이미지 미리보기: ${preview}`)
    return
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 필요 (.env.local)')
    process.exit(1)
  }
  const supabase = createClient(url, key)

  const { error: upErr } = await supabase.storage
    .from('whiskies')
    .upload(fileName, cutout, { contentType: 'image/webp', upsert: true })
  if (upErr) {
    console.error('Storage 업로드 실패:', upErr.message)
    process.exit(1)
  }
  console.log(`· Storage 업로드 완료: whiskies/${fileName}`)

  const { error: dbErr } = await supabase.from('whiskies').upsert(row)
  if (dbErr) {
    console.error('DB upsert 실패:', dbErr.message)
    process.exit(1)
  }
  console.log(`· DB 등록 완료 → https://maltlog.kr/whisky/${slug}`)
}

main().catch(e => {
  console.error('실패:', e)
  process.exit(1)
})
