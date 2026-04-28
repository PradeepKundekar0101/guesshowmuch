import { MessageCircle } from "lucide-react"
import { PostCard } from "@/components/feed/PostCard"
import type { Post } from "@/lib/queries/posts"

type FeedListProps = {
  posts: Post[]
}

export function FeedList({ posts }: FeedListProps) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-rule bg-paper-dim">
          <MessageCircle size={22} strokeWidth={1.5} className="text-ink-soft" />
        </div>
        <p className="mt-5 font-display text-2xl tracking-tight text-ink">
          Quiet on the wire
        </p>
        <p className="mt-2 max-w-[260px] text-[13px] leading-relaxed text-ink-soft">
          Be the first voice. Share a find, a sleeper deal, a long-running
          favourite — anything cheap and good.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
