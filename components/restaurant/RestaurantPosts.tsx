import { MessageCircle } from "lucide-react"
import { PostCard } from "@/components/feed/PostCard"
import type { Post } from "@/lib/queries/posts"

type RestaurantPostsProps = {
  posts: Post[]
}

export function RestaurantPosts({ posts }: RestaurantPostsProps) {
  return (
    <section className="border-t border-rule pt-6">
      <div className="flex items-baseline justify-between">
        <h3 className="eyebrow inline-flex items-center gap-1.5">
          <MessageCircle size={11} strokeWidth={2.25} />
          Posts mentioning this spot
        </h3>
        <span className="price-num text-[12px] text-ink-muted">
          {String(posts.length).padStart(2, "0")}
        </span>
      </div>

      {posts.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-rule px-4 py-5 text-center text-[12px] italic text-ink-muted">
          No mentions yet — share a find on the feed and tag this restaurant.
        </p>
      ) : (
        <div className="mt-3 space-y-2.5">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} hideRestaurant />
          ))}
        </div>
      )}
    </section>
  )
}
