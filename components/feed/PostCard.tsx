import Image from "next/image"
import Link from "next/link"
import { MapPin, ChevronRight } from "lucide-react"
import { anonymizeEmail } from "@/lib/utils/auth"
import { formatRelativeTime } from "@/lib/utils/time"
import { formatPrice } from "@/lib/utils/price"
import { PlaceholderImage } from "@/components/shared/PlaceholderImage"
import type { Post } from "@/lib/queries/posts"

type PostCardProps = {
  post: Post
  /** Hide the restaurant chip (e.g. when rendered inside that restaurant's page) */
  hideRestaurant?: boolean
}

function initials(email: string) {
  const handle = email.split("@")[0] || email
  return handle.slice(0, 2).toUpperCase()
}

export function PostCard({ post, hideRestaurant = false }: PostCardProps) {
  const showRestaurant = !hideRestaurant && post.restaurant

  return (
    <article className="overflow-hidden rounded-2xl border border-rule bg-surface transition-all hover:shadow-[0_4px_20px_rgba(20,20,23,0.04)]">
      <div className="p-4">
        <header className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-dim text-[10px] font-semibold tracking-tight text-ink-soft ring-1 ring-rule">
            {initials(post.user_email)}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[13px] font-medium text-ink">
              {anonymizeEmail(post.user_email)}
            </p>
            <p className="text-[11px] uppercase tracking-[0.06em] text-ink-muted">
              {formatRelativeTime(post.created_at)}
            </p>
          </div>
        </header>

        <p className="mt-3 text-[14px] leading-relaxed text-ink whitespace-pre-line">
          {post.content}
        </p>
      </div>

      {post.photo_url && (
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper-dim">
          <Image
            src={post.photo_url}
            alt="Post photo"
            fill
            sizes="(max-width: 768px) 100vw, 28rem"
            className="object-cover"
          />
        </div>
      )}

      {showRestaurant && post.restaurant && (
        <Link
          href={`/restaurant/${post.restaurant.id}`}
          className="group flex items-center gap-3 border-t border-rule bg-paper-dim/40 px-4 py-3 transition-colors hover:bg-paper-dim"
        >
          {post.restaurant.photo_url ? (
            <Image
              src={post.restaurant.photo_url}
              alt={post.restaurant.name}
              width={36}
              height={36}
              className="h-9 w-9 shrink-0 rounded-lg object-cover ring-1 ring-rule"
            />
          ) : (
            <PlaceholderImage className="h-9 w-9 shrink-0 rounded-lg ring-1 ring-rule" size="sm" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-ink">
              {post.restaurant.name}
            </p>
            <p className="truncate text-[11px] uppercase tracking-[0.08em] text-ink-muted">
              <MapPin
                size={9}
                strokeWidth={2}
                className="mr-1 inline-block align-[-1px]"
              />
              {post.restaurant.suburb}
              <span className="mx-1.5 text-ink-faint">·</span>
              <span className="price-num normal-case tracking-tight text-ink-soft">
                {formatPrice(post.restaurant.price)}
              </span>
            </p>
          </div>
          <ChevronRight
            size={15}
            strokeWidth={2}
            className="shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-ink"
          />
        </Link>
      )}
    </article>
  )
}
