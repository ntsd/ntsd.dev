# ntsd-dev-worker

This Cloudflare worker created for my website [ntsd.dev](https://ntsd.dev/) for now it only have only feature.

## Development

create `wrangler.toml` from `wrangler.toml.example` and update the configs and environments

### Start development server

```SHELL
wrangler dev
```

### Publish to production

```SHELL
wrangler publish --env production
```

## Service worker cache bust

This Cloudflare worker will response hash cache to client to refetch when a content is updated.

When the [Gulp task](https://github.com/ntsd/ntsd.dev/blob/master/gulpfile.babel.js) generate new file it will hash the file and when the hash changed, the gulp task will put the new hash to the worker.

When the [Service Worker](https://github.com/ntsd/ntsd.dev/blob/master/src/js/sw.js) handle fetch event it will request the worker to get cache hash, when the hash not match to the cache it will refetch the content.
