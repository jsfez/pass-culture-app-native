import { useQuery } from '@tanstack/react-query'

import { api } from 'api/api'
import { MovieCalendarResponse } from 'api/gen'
import { locationStore } from 'libs/locationV2/location.store'
import { QueryKeys } from 'libs/queryKeys'

const DEFAULT_RADIUS_KM = 50 // in kilometer

export const useOfferMovieCalendarQuery = <TData = MovieCalendarResponse>(
  { offer },
  options?: {
    enabled: boolean
    select?: (data: MovieCalendarResponse) => TData
  }
) => {
  const userLocation = locationStore.hooks.useUserLocation()

  const allocineId = offer?.extraData?.allocineId
  const visa = allocineId ? undefined : offer?.extraData?.visa
  const longitude = userLocation?.longitude ?? offer?.venue.coordinates.longitude ?? 0
  const latitude = userLocation?.latitude ?? offer?.venue.coordinates.latitude ?? 0
  const radius = DEFAULT_RADIUS_KM * 1000

  return useQuery<MovieCalendarResponse, Error, TData>({
    queryFn: async () =>
      api.getNativeV1MovieCalendar(latitude, longitude, allocineId, visa, radius),
    queryKey: [QueryKeys.OFFER_MOVIE_CALENDAR, latitude, longitude, allocineId, visa, radius],
    select: options?.select,
  })
}
