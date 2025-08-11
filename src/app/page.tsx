import NightReignTimer from '@/components/night-reign-timer';

export default function Home() {
  return (
    <main className="relative w-full h-screen overflow-hidden flex items-start justify-start p-4 bg-background font-body">
      <NightReignTimer />
    </main>
  );
}
