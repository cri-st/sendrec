-- Re-queue existing MP4/MOV uploads for the normalize worker now that it
-- also re-encodes oversized-bitrate files, not just iOS-incompatible ones
-- (see internal/video/normalize.go, needsNormalization/deliveryBitrateLimit).
-- Videos already marked ios_normalized=true were never re-evaluated under
-- the new criteria, so the worker would otherwise skip them forever.
--
-- Threshold uses the lowest per-resolution delivery cap (720p tier,
-- 3.75 Mbps) so no real candidate is missed; the worker re-probes each
-- file's actual resolution/bitrate before deciding whether to re-encode,
-- so flagging a few videos that turn out fine at their real resolution
-- just costs a harmless re-check, not an unwanted re-encode.
UPDATE videos
SET ios_normalized = false,
    updated_at = now()
WHERE status = 'ready'
  AND content_type IN ('video/mp4', 'video/quicktime')
  AND ios_normalized = true
  AND duration > 0
  AND file_size > 0
  AND (file_size * 8 / duration) > 3750000;
