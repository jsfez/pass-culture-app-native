import React, { FunctionComponent } from 'react'
import styled from 'styled-components/native'

import { VenueScreenings } from 'api/gen'
import { useMovieCalendar } from 'features/offer/components/MoviesScreeningCalendar/MovieCalendarContext'
import { isDateNotWithinNextNbDays } from 'features/offer/components/MoviesScreeningCalendar/moviesOffer.builder'
import { NextScreeningButton } from 'features/offer/components/MoviesScreeningCalendar/NextScreeningButton'
import { OfferEventCardListV2 } from 'features/offer/components/OfferEventCardList/OfferEventCardListV2'
import { VenueBlock } from 'features/offer/components/OfferVenueBlock/VenueBlock'
import { analytics } from 'libs/analytics/provider'
import { LocationMode } from 'libs/location/types'
import { locationStore } from 'libs/locationV2/location.store'
import { humanizeDistance } from 'libs/parsers/formatDistance'
import { BookOfferModal } from 'shared/offer/components/BookOfferModal/BookOfferModal'
import { useModal } from 'ui/components/modals/useModal'

type CineBlockV2Props = {
  offerId: number
  venueScreenings: VenueScreenings
  onSeeVenuePress?: VoidFunction
  withDivider?: boolean
}

export const CineBlockV2: FunctionComponent<CineBlockV2Props> = ({
  offerId,
  venueScreenings,
  onSeeVenuePress,
  withDivider,
}) => {
  const { goToDate } = useMovieCalendar()
  const locationMode = locationStore.hooks.useLocationMode()
  const modalSettings = useModal(false)

  const distance = humanizeDistance(venueScreenings.distance).replace('.', ',')
  const nextDate = venueScreenings.nextScreening?.beginningDatetime
    ? new Date(venueScreenings.nextScreening?.beginningDatetime)
    : null
  const showNextScreeningButton = venueScreenings.dayScreenings.length === 0

  const onPress = () => {
    analytics.logConsultAuthenticationModal(offerId)
    modalSettings.showModal()
  }

  return (
    <React.Fragment>
      <CineBlockContainer>
        <VenueBlock
          venueId={venueScreenings.venueId}
          title={venueScreenings.label}
          subtitle={venueScreenings.address}
          onSeeVenuePress={onSeeVenuePress}
          venueImageUrl={venueScreenings.thumbUrl ?? undefined}
          distance={distance}
          hasVenuePage={!!onSeeVenuePress}
          shouldShowDistances={
            locationMode !== LocationMode.EVERYWHERE && venueScreenings.distance !== 0
          }
          isOfferAtSameAddressAsVenue
        />

        {showNextScreeningButton && !!nextDate ? (
          <NextScreeningButton
            date={nextDate}
            onPress={
              isDateNotWithinNextNbDays(new Date(), nextDate, 15)
                ? () => onPress()
                : () => goToDate(nextDate)
            }
          />
        ) : (
          <OfferEventCardListV2 venueScreenings={venueScreenings} offerId={offerId} />
        )}
        {venueScreenings.nextScreening ? (
          <BookOfferModal
            screening={venueScreenings.nextScreening}
            offerId={offerId}
            modalSettings={modalSettings}></BookOfferModal>
        ) : null}
      </CineBlockContainer>
      {withDivider ? <Divider testID="divider" /> : null}
    </React.Fragment>
  )
}

const CineBlockContainer = styled.View(({ theme }) => ({
  marginHorizontal: theme.contentPage.marginHorizontal,
  paddingTop: theme.designSystem.size.spacing.xl,
  gap: theme.designSystem.size.spacing.l,
}))

const Divider = styled.View(({ theme }) => ({
  height: 1,
  backgroundColor: theme.designSystem.color.background.subtle,
  marginHorizontal: theme.isDesktopViewport ? undefined : theme.contentPage.marginHorizontal,
  marginTop: theme.isDesktopViewport
    ? theme.designSystem.size.spacing.xl
    : theme.designSystem.size.spacing.l,
}))
