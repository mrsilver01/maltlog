'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useAuth } from '@/app/context/AuthContext'

interface Announcement {
  id: string
  title: string
  body: string
  level: 'info' | 'warning' | 'critical'
  display: 'banner' | 'modal'
  audience: 'all' | 'guest' | 'auth'
  dismissible: boolean
  start_at: string
  end_at: string | null
}

export default function AnnouncementBanner() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { user } = useAuth()
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnnouncement()
  }, [user])

  const loadAnnouncement = async () => {
    try {
      setLoading(true)

      // 현재 활성화된 배너 공지사항 조회
      const { data: announcements, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('display', 'banner')
        .lte('start_at', new Date().toISOString())
        .or(`end_at.is.null,end_at.gte.${new Date().toISOString()}`)
        .order('level', { ascending: false }) // critical 우선
        .order('start_at', { ascending: false })
        .limit(1)

      if (error) {
        console.error('공지사항 로드 실패:', error)
        return
      }

      if (announcements && announcements.length > 0) {
        const notice = announcements[0]

        // 대상 사용자 필터링
        const shouldShow =
          notice.audience === 'all' ||
          (notice.audience === 'auth' && user) ||
          (notice.audience === 'guest' && !user)

        if (shouldShow) {
          // 사용자가 이미 해제했는지 확인
          if (user && notice.dismissible) {
            const { data: dismissal, error: dismissalError } = await supabase
              .from('announcement_dismissals')
              .select('id')
              .eq('notice_id', notice.id)
              .eq('user_id', user.id)
              .maybeSingle()

            if (dismissalError) {
              // 다른 에러만 로깅 (406은 더 이상 발생하지 않음)
              console.error('dismiss check failed:', dismissalError)
            }

            const isDismissed = !!dismissal
            if (!isDismissed) {
              setAnnouncement(notice)
            }
          } else if (!user) {
            // 비로그인 사용자는 세션 스토리지로 해제 상태 관리
            const storageKey = `dismissed_announcement_${notice.id}`
            const isDismissed = sessionStorage.getItem(storageKey) === 'true'

            if (!isDismissed) {
              setAnnouncement(notice)
            }
          } else {
            // dismissible이 false인 경우 항상 표시
            setAnnouncement(notice)
          }
        }
      }
    } catch (error) {
      console.error('공지사항 로드 중 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = async () => {
    if (!announcement) return

    try {
      if (user) {
        // 로그인된 사용자: DB에 해제 기록 저장 (멱등/중복 안전)
        const { error: upErr } = await supabase
          .from('announcement_dismissals')
          .upsert(
            {
              notice_id: announcement.id,
              user_id: user.id
            },
            {
              onConflict: 'notice_id,user_id',
              ignoreDuplicates: true
            }
          )

        if (upErr) {
          console.error('dismiss upsert failed:', upErr)
          return
        }
      } else {
        // 비로그인 사용자: 세션 스토리지에 해제 상태 저장
        const storageKey = `dismissed_announcement_${announcement.id}`
        sessionStorage.setItem(storageKey, 'true')
      }

      setDismissed(true)
      setAnnouncement(null)
    } catch (error) {
      console.error('공지사항 해제 중 오류:', error)
    }
  }

  // 로딩 중이거나 공지사항이 없거나 이미 해제된 경우 렌더링 안함
  if (loading || !announcement || dismissed) {
    return null
  }

  // 레벨별 스타일 설정
  const getStyleByLevel = (level: string) => {
    switch (level) {
      case 'critical':
        return {
          bg: 'bg-red-600',
          text: 'text-white',
          icon: '🚨'
        }
      case 'warning':
        return {
          bg: 'bg-amber-500',
          text: 'text-white',
          icon: '⚠️'
        }
      case 'info':
      default:
        return {
          bg: 'bg-blue-600',
          text: 'text-white',
          icon: 'ℹ️'
        }
    }
  }

  const style = getStyleByLevel(announcement.level)

  return (
    <div className={`${style.bg} ${style.text} relative`}>
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-lg flex-shrink-0" aria-hidden="true">
              {style.icon}
            </span>
            <div className="flex-1 min-w-0">
              <span className="font-semibold">{announcement.title}</span>
              {announcement.body && (
                <span className="ml-2 opacity-90">{announcement.body}</span>
              )}
            </div>
          </div>

          {announcement.dismissible && (
            <button
              onClick={handleDismiss}
              className="ml-4 flex-shrink-0 text-white/80 hover:text-white transition-colors underline text-sm"
              aria-label="공지사항 닫기"
            >
              닫기
            </button>
          )}
        </div>
      </div>
    </div>
  )
}