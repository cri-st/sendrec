-- Best-effort rollback: re-mark as normalized any video still awaiting
-- the worker (ios_normalized=false) that matches the same threshold this
-- migration used. Not a perfect inverse — videos the worker has already
-- reprocessed by the time this runs are left untouched, since they're no
-- longer ios_normalized=false and there's no way to distinguish "actually
-- re-encoded" from "probed and left alone" after the fact.
UPDATE videos
SET ios_normalized = true,
    updated_at = now()
WHERE status = 'ready'
  AND content_type IN ('video/mp4', 'video/quicktime')
  AND ios_normalized = false
  AND duration > 0
  AND file_size > 0
  AND (file_size * 8 / duration) > 3750000;
