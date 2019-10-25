/* we expand the content bars so we can also load the images */
forEach('img[data-thumbnailurl]', img => img.src = img.dataset.thumbnailurl);
