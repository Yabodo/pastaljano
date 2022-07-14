export default defineNuxtRouteMiddleware(() => {
  const allowedEmails = [
    "kjoeveer@gmail.com",
    "yabodo@vivaldi.net",
    "pastaljano@gmail.com",
    "alexaus2002@gmail.com",
    "alex.aus.est@gmail.com",
    "freddy.jakobson@gmail.com",
    "goodmenmedia@gmail.com",
    "avainaru@gmail.com",
    "aureliakene@gmail.com",
    "kaspar940@gmail.com",
    "rudolftoikka@gmail.com",
    "triinulota@gmail.com",
    "loora0lepp@gmail.com",
    "rasmus.korve@gmail.com",
  ];
  const protectedPaths = [
    "/team",
    "/team/cashier",
    "/team/pizza",
    "/team/pasta",
  ];

  const user = useSupabaseUser();
  const router = useRouter();
  const route = useRoute();

  if (!user.value) {
    return router.push("/login");
  } else {
    if (
      protectedPaths.includes(route.path) &&
      !allowedEmails.includes(user.value.email)
    ) {
      return router.push("/");
    }
  }
});
