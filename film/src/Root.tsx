import { Composition, Folder } from "remotion";
import { GpuTest } from "./dev/GpuTest";
import { RoomDebug } from "./dev/RoomDebug";
import { ShotOnly } from "./dev/ShotOnly";
import { Film, FILM_FRAMES, FPS } from "./Film";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="Film" component={Film} durationInFrames={FILM_FRAMES} fps={FPS} width={1920} height={1080} />
      <Folder name="Dev">
        <Composition id="GpuTest" component={GpuTest} durationInFrames={48} fps={24} width={1920} height={1080} />
        <Composition id="RoomDebug0" component={RoomDebug} defaultProps={{ post: 0 }} durationInFrames={24} fps={24} width={1920} height={1080} />
        <Composition id="ShotOnly" component={ShotOnly} defaultProps={{ id: "S20" }} durationInFrames={400} fps={24} width={1920} height={1080} />
        <Composition id="RoomDebug1" component={RoomDebug} defaultProps={{ post: 1 }} durationInFrames={24} fps={24} width={1920} height={1080} />
      </Folder>
    </>
  );
};
