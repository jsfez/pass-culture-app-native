import React from 'react'

import { Bookability, Screening } from 'api/gen'
import { StepperOrigin } from 'features/navigation/navigators/RootNavigator/types'
import { AuthenticationModal } from 'shared/offer/components/AuthenticationModal/AuthenticationModal'
import { ModalSettings } from 'ui/components/modals/useModal'

type BookOfferModalProps = {
  screening?: Screening
  offerId: number
  modalSettings: ModalSettings
}

export const BookOfferModal = ({ screening, offerId, modalSettings }: BookOfferModalProps) => {
  switch (screening?.bookability) {
    case Bookability.AUTHENTICATION_REQUIRED:
      return (
        <AuthenticationModal
          visible={modalSettings.visible}
          hideModal={modalSettings.hideModal}
          offerId={offerId}
          from={StepperOrigin.BOOKING}
        />
      )

    default:
      return null
  }
}
