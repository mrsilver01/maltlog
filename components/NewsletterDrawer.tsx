'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { newsletter } from '@/content/newsletter'
import { toPublicImageUrl } from '@/lib/images'

/**
 * 몰트로그 신문 — 홈 우측의 신문 끈을 당기면 왼쪽으로 펼쳐지는 뉴스레터 패널.
 * 콘텐츠는 content/newsletter.ts 에서 관리.
 */

/** 이미지 경로 해석: public 정적(/...) · 외부(http) · Storage 파일명 모두 지원 */
function resolveImg(src: string): string {
  if (!src) return ''
  if (src.startsWith('http') || src.startsWith('/')) return src
  return toPublicImageUrl(src)
}

export default function NewsletterDrawer() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [leadImgOk, setLeadImgOk] = useState(true)
  const leadImgRef = useRef<HTMLImageElement>(null)

  // 하이드레이션 전에 이미지 로드가 이미 실패했으면 onError가 안 잡히므로 마운트 시 보정
  useEffect(() => {
    const img = leadImgRef.current
    if (img && img.complete && img.naturalWidth === 0) setLeadImgOk(false)
  }, [])

  // ESC로 닫기 + 열려있는 동안 배경 스크롤 잠금
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open])

  const { lead, spotlight } = newsletter

  return (
    <>
      {/* 신문 끈 탭 (닫힘 상태) */}
      <button
        aria-label="몰트로그 신문 펼치기"
        onClick={() => setOpen(true)}
        className={`fixed right-0 top-1/3 z-40 group transition-all duration-300 ${
          open ? 'translate-x-full opacity-0' : 'translate-x-0'
        }`}
      >
        <div className="flex flex-col items-center">
          {/* 말린 신문 가장자리 */}
          <div className="bg-[#F7F1E3] border border-r-0 border-[#C9BBA4] rounded-l-lg px-2 py-4 shadow-[-3px_3px_10px_rgba(45,21,32,0.25)] group-hover:px-3 transition-all duration-300">
            <div
              className="text-[10px] font-bold tracking-[0.25em] text-[#3D2B1F]"
              style={{ writingMode: 'vertical-rl' }}
            >
              MALTLOG TIMES
            </div>
          </div>
          {/* 끈 + 술 장식 */}
          <div className="w-px h-7 bg-[#722F37]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#722F37] shadow-sm group-hover:translate-y-0.5 transition-transform" />
        </div>
      </button>

      {/* 펼쳐지는 신문 */}
      <div
        className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}
        style={{ perspective: '1600px' }}
        aria-hidden={!open}
      >
        {/* 배경 */}
        <div
          className={`absolute inset-0 bg-[#1F0E16]/50 backdrop-blur-[2px] transition-opacity duration-500 ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setOpen(false)}
        />

        {/* 신문 패널 — 오른쪽 모서리를 축으로 왼쪽으로 펼쳐짐 */}
        <div
          className="absolute right-0 top-0 h-full w-[min(480px,94vw)] origin-right transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            transform: open
              ? 'translateX(0) rotateY(0deg)'
              : 'translateX(100%) rotateY(-55deg)',
          }}
        >
          <div className="h-full overflow-y-auto bg-[#F7F1E3] shadow-[-12px_0_40px_rgba(31,14,22,0.45)] border-l border-[#C9BBA4]">
            {/* 닫기 */}
            <button
              aria-label="신문 접기"
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full border border-[#C9BBA4] bg-[#F7F1E3] text-[#3D2B1F] hover:bg-[#EDE3CE] transition-colors text-sm"
            >
              ✕
            </button>

            <div className="px-6 sm:px-8 py-7">
              {/* 마스트헤드 */}
              <div className="text-center border-b-2 border-[#3D2B1F] pb-3 mb-1">
                <div className="text-[9px] tracking-[0.5em] text-[#722F37] font-semibold mb-1.5">
                  위스키의 모든 기록
                </div>
                <h2 className="font-serif text-3xl font-black tracking-tight text-[#2A1A12]">
                  MALTLOG TIMES
                </h2>
              </div>
              <div className="flex justify-between text-[10px] text-[#7A5C49] border-b border-[#C9BBA4] py-1.5 mb-6">
                <span>제 {newsletter.issueNo}호</span>
                <span>{newsletter.dateLabel}</span>
                <span>maltlog.kr</span>
              </div>

              {/* 1면 톱 기사 */}
              <article className="mb-7">
                <div className="text-[10px] tracking-[0.35em] text-[#722F37] font-bold mb-2">
                  {lead.kicker}
                </div>
                <h3 className="font-serif text-2xl font-black text-[#2A1A12] leading-[1.25] mb-2">
                  {lead.headline}
                </h3>
                <p className="text-[13px] text-[#5C4836] italic leading-relaxed mb-4">
                  {lead.dek}
                </p>

                {/* 사진 (실패 시 크림 플레이스홀더) */}
                {leadImgOk ? (
                  <figure className="mb-4">
                    <img
                      ref={leadImgRef}
                      src={resolveImg(lead.image)}
                      alt={lead.headline}
                      onError={() => setLeadImgOk(false)}
                      className="w-full border border-[#C9BBA4] shadow-sm"
                    />
                    {lead.imageCaption && (
                      <figcaption className="text-[10px] text-[#9C8270] italic mt-1.5 text-center">
                        {lead.imageCaption}
                      </figcaption>
                    )}
                  </figure>
                ) : (
                  <div className="mb-4 aspect-[4/3] flex items-center justify-center border border-dashed border-[#C9BBA4] bg-[#EFE6D2]">
                    <span className="text-[10px] tracking-[0.3em] text-[#9C8270]">MALTLOG TIMES</span>
                  </div>
                )}

                <p className="text-[13px] leading-relaxed text-[#4A3527]">{lead.body}</p>

                {/* 팩트 그리드 */}
                {lead.facts.length > 0 && (
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 mt-4 pt-4 border-t border-[#C9BBA4]">
                    {lead.facts.map((f) => (
                      <div key={f.label}>
                        <dt className="text-[9px] tracking-[0.25em] text-[#722F37] font-bold mb-0.5">
                          {f.label}
                        </dt>
                        <dd className="text-[12px] text-[#2A1A12] font-medium leading-snug">{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                {/* 테이스팅 노트 */}
                {lead.tasting && (
                  <div className="mt-3 bg-[#EFE6D2] border-l-2 border-[#722F37] px-3 py-2">
                    <span className="text-[9px] tracking-[0.25em] text-[#722F37] font-bold">테이스팅 </span>
                    <span className="text-[12px] text-[#4A3527]">{lead.tasting}</span>
                  </div>
                )}

                {lead.link && (
                  <button
                    onClick={() => {
                      setOpen(false)
                      if (lead.link!.startsWith('http')) window.open(lead.link, '_blank', 'noopener')
                      else router.push(lead.link!)
                    }}
                    className="mt-4 w-full border border-[#722F37] text-[#722F37] text-xs font-semibold tracking-widest py-2 hover:bg-[#722F37] hover:text-[#F7F1E3] transition-colors"
                  >
                    자세히 보러 가기 →
                  </button>
                )}
              </article>

              {/* 이주의 추천 한 잔 (DB 위스키) */}
              {spotlight && (
                <div className="border-t-2 border-[#3D2B1F] pt-4 mb-7">
                  <div className="text-[10px] tracking-[0.35em] text-[#722F37] font-bold mb-3">
                    이주의 추천 한 잔
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-20 h-30 shrink-0 bg-white border border-[#C9BBA4] p-1.5 shadow-sm rotate-[-1.5deg]">
                      <img
                        src={resolveImg(spotlight.image)}
                        alt={spotlight.name}
                        className="w-full h-full object-contain"
                        style={{ height: '7rem' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-lg font-bold text-[#2A1A12] leading-snug">
                        {spotlight.name}
                      </h4>
                      <div className="text-xs text-[#722F37] font-semibold mt-0.5 mb-1.5">
                        “{spotlight.tagline}”
                      </div>
                      <p className="text-[12px] leading-relaxed text-[#4A3527]">{spotlight.body}</p>
                      <button
                        onClick={() => {
                          setOpen(false)
                          router.push(`/whisky/${spotlight.whiskyId}`)
                        }}
                        className="mt-2 text-[11px] font-semibold text-[#722F37] hover:text-[#96424E] underline underline-offset-2"
                      >
                        자세히 보기 →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 단신 */}
              {newsletter.briefs.length > 0 && (
                <div className="border-t-2 border-[#3D2B1F] pt-4">
                  <div className="text-[10px] tracking-[0.35em] text-[#722F37] font-bold mb-3">
                    단신
                  </div>
                  <div className="space-y-4">
                    {newsletter.briefs.map((brief, i) => (
                      <div key={i} className="border-b border-dashed border-[#C9BBA4] pb-3 last:border-0">
                        <div className="flex items-baseline justify-between gap-2 mb-1">
                          <h4 className="font-serif text-sm font-bold text-[#2A1A12]">{brief.title}</h4>
                          {brief.date && <span className="text-[10px] text-[#9C8270] shrink-0">{brief.date}</span>}
                        </div>
                        <p className="text-xs leading-relaxed text-[#5C4836]">{brief.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 편집자 주 */}
              {newsletter.editorsNote && (
                <div className="mt-6 pt-3 border-t border-[#C9BBA4] text-center text-[11px] italic text-[#7A5C49]">
                  {newsletter.editorsNote}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
