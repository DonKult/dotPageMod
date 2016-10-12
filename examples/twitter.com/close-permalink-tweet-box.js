/* The close button for the modal window requires Javascript …
   Better would be creating a real link, but its easier this way */
const stripPermalink = e => location.pathname = '/' + location.pathname.split('/')[1];
forEach('.PermalinkProfile-dismiss', cb => addEventListener(cb, 'click', stripPermalink));
