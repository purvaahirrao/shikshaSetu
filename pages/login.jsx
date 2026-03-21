// Alias so /login opens the same screen as /
export async function getServerSideProps() {
  return { redirect: { destination: '/', permanent: false } };
}

export default function LoginAlias() {
  return null;
}
