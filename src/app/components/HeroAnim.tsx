import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas';

export default function HeroAnim() {
  const { RiveComponent } = useRive({
    src:"/dwelli_flower.riv",
    stateMachines: "State Machine 1",
    layout: new Layout({
      fit: Fit.Contain, // Change to: rive.Fit.Contain, or Cover
      alignment: Alignment.Center,
    }),
    autoplay: true,
  });

  return (
    <RiveComponent className='w-full sm:w-3/4 h-full absolute sm:-bottom-24 -bottom-24 -z-0 pointer-events-none sm:pointer-events-auto' />
  );
}