import { PostCard } from "@/components/feed/PostCard"
import type { Post } from "@/lib/queries/posts"

type FeedListProps = {
  posts: Post[]
}

export function FeedList({ posts }: FeedListProps) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-5xl">💬</span>
        <p className="mt-4 text-gray-500">No posts yet.</p>
        <p className="mt-1 text-sm text-gray-400">Be the first to share a cheap eat find!</p>
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
