import { getPosts } from "@/lib/queries/posts"
import { getActiveRestaurants } from "@/lib/queries/restaurants"
import { FeedList } from "@/components/feed/FeedList"
import { NewPostForm } from "@/components/feed/NewPostForm"
import { UserBadge } from "@/components/auth/UserBadge"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function FeedPage() {
  const [posts, restaurants] = await Promise.all([
    getPosts(),
    getActiveRestaurants(),
  ])

  return (
    <div className="min-h-dvh bg-paper pb-20">
      <header className="border-b border-rule bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto max-w-md px-5 pt-7 pb-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="eyebrow">The wire · {posts.length} {posts.length === 1 ? "post" : "posts"}</p>
              <h1 className="mt-1 font-display text-[34px] leading-[0.95] tracking-tight text-ink">
                Word on the <em>street</em>
              </h1>
              <p className="mt-1.5 max-w-[280px] text-[13px] leading-snug text-ink-soft">
                Cheap eat finds, in real time, from real eaters.
              </p>
            </div>
            <UserBadge />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-md space-y-4 px-4 py-5">
        <NewPostForm restaurants={restaurants} />
        <FeedList posts={posts} />
      </div>
    </div>
  )
}
