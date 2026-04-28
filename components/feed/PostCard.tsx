import Image from "next/image"
import { anonymizeEmail } from "@/lib/utils/auth"
import { formatRelativeTime } from "@/lib/utils/time"
import type { Post } from "@/lib/queries/posts"

type PostCardProps = {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          {anonymizeEmail(post.user_email)}
        </span>
        <span className="text-xs text-gray-400">
          {formatRelativeTime(post.created_at)}
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-gray-800">{post.content}</p>
      {post.photo_url && (
        <div className="mt-3 overflow-hidden rounded-xl">
          <Image
            src={post.photo_url}
            alt="Post photo"
            width={400}
            height={300}
            className="w-full object-cover"
          />
        </div>
      )}
    </div>
  )
}
