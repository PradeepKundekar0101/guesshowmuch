import { anonymizeEmail } from "@/lib/utils/auth"
import { formatRelativeTime } from "@/lib/utils/time"
import type { Comment } from "@/lib/queries/comments"

type CommentListProps = {
  comments: Comment[]
}

function initials(email: string) {
  const handle = email.split("@")[0] || email
  return handle.slice(0, 2).toUpperCase()
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <p className="py-3 text-[13px] italic text-ink-muted">
        No comments yet — be the first to add some context.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper-dim text-[10px] font-semibold tracking-tight text-ink-soft ring-1 ring-rule">
            {initials(comment.user_email)}
          </div>
          <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-rule bg-paper-dim/50 px-3.5 py-2.5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-[12px] font-medium text-ink">
                {anonymizeEmail(comment.user_email)}
              </span>
              <span className="text-[10px] uppercase tracking-[0.06em] text-ink-muted">
                {formatRelativeTime(comment.created_at)}
              </span>
            </div>
            <p className="mt-1 text-[13.5px] leading-relaxed text-ink">
              {comment.content}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
