-- Country of the member at sign-up, taken from Cloudflare's edge geolocation.
-- Used only for the owner's aggregate member breakdown; never shown per-user.
ALTER TABLE `users` ADD `country` text DEFAULT '' NOT NULL;
