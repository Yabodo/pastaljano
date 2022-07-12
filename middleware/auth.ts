export default defineNuxtRouteMiddleware(() => {
  const allowedEmails = [
    "kjoeveer@gmail.com",
    "yabodo@vivaldi.net",
    "pastaljano@gmail.com",
    "alexaus2002@gmail.com",
    "Freddy.Jakobson@gmail.com",
    "goodmenmedia@gmail.com",
    "avainaru@gmail.com",
    "aureliakene@gmail.com",
  ];

  const user = useSupabaseUser();
  const router = useRouter();
  const route = useRoute();

  if (!user.value) {
    return router.push("/login");
  } else {
    if (route.path == "/cashier" && !allowedEmails.includes(user.value.email)) {
      return router.push("/");
    }
  }
});
