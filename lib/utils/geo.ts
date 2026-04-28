export const BRISBANE_CENTER = {
  lat: -27.4698,
  lng: 153.0251,
} as const

export const DEFAULT_ZOOM = 13

export function getUserLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      (error) => {
        reject(error)
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    )
  })
}
