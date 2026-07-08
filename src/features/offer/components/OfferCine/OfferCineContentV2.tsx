import React, { FC, useEffect, useState } from 'react'
import { View } from 'react-native'
import styled from 'styled-components/native'

import { DayVenueScreenings } from 'api/gen'
import { ExpandingFlatList } from 'features/offer/components/ExpandingFlatlist/ExpandingFlatList'
import {
  useDisableCalendarDates,
  useDisplayCalendar,
  useMovieCalendar,
} from 'features/offer/components/MoviesScreeningCalendar/MovieCalendarContext'
import { CineBlockSkeleton } from 'features/offer/components/OfferCine/CineBlockSkeleton'
import { CineBlockV2 } from 'features/offer/components/OfferCine/CineBlockV2'
import { INITIAL_LIST_SIZE, expandList, hasReachedEnd } from 'features/offer/helpers/expandableList'
import { formatDateToISOStringWithoutTime } from 'libs/parsers/formatDates'
import { Button } from 'ui/designSystem/Button/Button'
import { PlainMore } from 'ui/svg/icons/PlainMore'
import { Typo } from 'ui/theme'

type Props = {
  offerId: number
  calendar: DayVenueScreenings[]
  isLoading: boolean
  onSeeVenuePress?: VoidFunction
}

export const OfferCineContentV2: FC<Props> = ({
  offerId,
  calendar,
  isLoading,
  onSeeVenuePress,
}) => {
  const { selectedDate } = useMovieCalendar()
  const venues =
    calendar?.find((value) => value.date === formatDateToISOStringWithoutTime(selectedDate))
      ?.screenings || []
  const disabledDates = calendar
    .filter((dayVenueScreenings) =>
      dayVenueScreenings.screenings.every((screenings) => screenings.dayScreenings.length === 0)
    )
    .map((dayVenuScreenings) => new Date(dayVenuScreenings.date))

  const [displayedLen, setDisplayedLen] = useState(INITIAL_LIST_SIZE)
  const hasStocksOnlyAfter15Days =
    calendar
      .map((dayVenueScreenings) => dayVenueScreenings.screenings)
      .findIndex((screenings) =>
        screenings.some((venueScreenings) => venueScreenings.dayScreenings.length > 0)
      ) > 0

  useDisplayCalendar(!hasStocksOnlyAfter15Days)
  useDisableCalendarDates(disabledDates)

  useEffect(() => {
    setDisplayedLen(INITIAL_LIST_SIZE)
  }, [selectedDate])

  return (
    <View>
      <ExpandingFlatList
        data={venues.slice(0, displayedLen)}
        isLoading={isLoading}
        skeletonListLength={3}
        renderSkeleton={() => <CineBlockSkeleton />}
        renderItem={({ item }) => (
          <CineBlockV2
            offerId={offerId}
            venueScreenings={item}
            onSeeVenuePress={onSeeVenuePress}
            withDivider
          />
        )}
        keyExtractor={(_, index) => `venue-cine-offers-${index}`}
      />
      {hasReachedEnd(venues, displayedLen) ? null : (
        <SeeMoreContainer>
          <Text>Aucune séance ne te correspond&nbsp;?</Text>
          <Button
            icon={PlainMore}
            wording="Afficher plus de cinémas"
            onPress={() => setDisplayedLen(expandList(venues, displayedLen))}
            variant="secondary"
            color="neutral"
            fullWidth
          />
        </SeeMoreContainer>
      )}
    </View>
  )
}

const SeeMoreContainer = styled.View(({ theme }) => ({
  alignItems: theme.isMobileViewport ? 'center' : undefined,
  marginTop: theme.designSystem.size.spacing.xl,
  gap: theme.designSystem.size.spacing.l,
  paddingHorizontal: theme.isMobileViewport ? theme.designSystem.size.spacing.xl : undefined,
  alignSelf: theme.isDesktopViewport ? 'flex-start' : undefined,
}))

const Text = styled(Typo.Body)(({ theme }) => ({
  color: theme.designSystem.color.text.subtle,
}))
