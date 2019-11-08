export default function({ store, redirect, $snack }) {
  // If the user is not authenticated
  if (!store.state.isLoggedIn) {
    store.dispatch('showSignInSnackbar')
    return redirect('/console')
  }
}
