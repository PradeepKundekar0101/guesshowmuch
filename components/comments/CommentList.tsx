import { anonymizeEmail } from "@/lib/utils/auth"
import { formatRelativeTime } from "@/lib/utils/time"
import type { Comment } from "@/lib/queries/comments"

type CommentListProps = {
  comments: Comment[]
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-gray-400">
        No comments yet. Be the first!
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <div key={comment.id} className="rounded-xl bg-gray-50 px-3 py-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">
              {anonymizeEmail(comment.user_email)}
            </span>
            <span className="text-xs text-gray-400">
              {formatRelativeTime(comment.created_at)}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-800">{comment.content}</p>
        </div>
      ))}
    </div>
  )
}
