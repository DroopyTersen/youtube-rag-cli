import { chunksIndexService } from "./src/azureSearch/chunksIndex.service";
import { ingestYoutubeVideo } from "./src/dataSources/youtube/ingestYoutubeVideo";

try {
  chunksIndexService.ensureIndex();
  const youtubeVideoId = "SvuzS7bs9s0";
  await ingestYoutubeVideo(youtubeVideoId);
} catch (err: any) {
  console.log(err);
}
