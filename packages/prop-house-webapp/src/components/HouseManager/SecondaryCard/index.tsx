import classes from './SecondaryCard.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../../Card';
import CreateRoundStep from '../../CreateRoundStep';
import { useAppSelector } from '../../../hooks';
import clsx from 'clsx';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper.min.css';
import { useEffect, useRef } from 'react';
import SwiperCore from 'swiper';
import { useAccount } from 'wagmi';

const SecondaryCard: React.FC = () => {
  const activeStep = useAppSelector(state => state.round.activeStep);
  const swiperRef = useRef<SwiperCore>();
  const { address: account } = useAccount();

  const steps = [
    {
      title: 'Select the house',
      text: 'Set the name and description',
    },
    {
      title: 'Name the round',
      text: 'Set the name and description',
    },
    {
      title: 'Set who can participate',
      text: 'Define who can vote in your round',
    },
    {
      title: 'Set the awards',
      text: 'Define number of winners and awards',
    },
    {
      title: 'Round timing',
      text: 'Set how long the round should be',
    },
    {
      title: 'Create the round 🎉',
      text: 'Review the round settings and create it',
    },
  ];

  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(activeStep - 1);
    }
  }, [activeStep]);

  return (
    <>
      {/* Desktop */}
      <Card
        bgColor={CardBgColor.White}
        borderRadius={CardBorderRadius.thirty}
        classNames={clsx(classes.secondaryCard, classes.hideOnMobile)}
      >
        {steps.map((step, idx) => (
          <CreateRoundStep
            activeStep={activeStep}
            stepNumber={idx + 1}
            title={step.title}
            text={step.text}
            key={idx}
          />
        ))}
      </Card>

      {/* Mobile */}
      {account && (
        <Card
          bgColor={CardBgColor.White}
          borderRadius={CardBorderRadius.thirty}
          classNames={clsx(classes.secondaryCard, classes.fullCard)}
        >
          <Swiper
            onSwiper={swiper => {
              swiperRef.current = swiper;
            }}
            initialSlide={0}
          >
            {steps.map((step, idx) => (
              <SwiperSlide>
                <CreateRoundStep
                  activeStep={activeStep}
                  stepNumber={idx + 1}
                  title={step.title}
                  text={step.text}
                  key={idx}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </Card>
      )}
    </>
  );
};

export default SecondaryCard;
