import { getPosts } from "@/lib/queries/posts"
import { FeedList } from "@/components/feed/FeedList"
import { NewPostForm } from "@/components/feed/NewPostForm"
import { UserBadge } from "@/components/auth/UserBadge"

export default async function FeedPage() {
  const posts = await getPosts()

  return (
    <div className="min-h-dvh bg-gray-50 pb-20">
      <div className="flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
        <div>
          <h1 className="text-lg font-bold text-gray-900">💬 Community Feed</h1>
          <p className="mt-0.5 text-xs text-gray-400">Share cheap eat finds</p>
        </div>
        <UserBadge />
      </div>

      <div className="space-y-4 px-4 py-4">
        <NewPostForm />
        <FeedList posts={posts} />
      </div>
    </div>
  )
}
