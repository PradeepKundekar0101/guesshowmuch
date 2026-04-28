export type Restaurant = {
  id: string
  name: string
  cuisine_type: string | null
  address: string | null
  suburb: string | null
  city: string
  latitude: number
  longitude: number
  dish_name: string
  price: number
  photo_url: string | null
  pin_type: "standard" | "featured" | "hot_deal" | "top_rated"
  verified_at: string
  flag_count: number
  vote_score: number
  up_count: number
  down_count: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type RestaurantInsert = Omit<
  Restaurant,
  | "id"
  | "created_at"
  | "updated_at"
  | "flag_count"
  | "vote_score"
  | "up_count"
  | "down_count"
  | "is_active"
> & {
  id?: string
  flag_count?: number
  vote_score?: number
  up_count?: number
  down_count?: number
  is_active?: boolean
}
