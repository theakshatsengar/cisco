import Chat from './Chat';

export const metadata = {
  title: 'chat',
  description: 'chat with cisco.',
};

export default function Page() {
  return (
    <section className="h-screen flex flex-col">
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        chat with cisco.
      </h1>

      <Chat />
    </section>
  );
}
