declare module "editorjs-html" {
  export type BlockTuneData = any;

  export interface OutputBlockData<Type extends string = string> {
    /**
     * Unique Id of the block
     */
    id?: string | number;
    /**
     * Tool type
     */
    type: Type;
    /**
     * Saved Block data
     */
    data: {};

    /**
     * Block Tunes data
     */
    tunes?: { [name: string]: BlockTuneData };
  }

  export interface OutputData {
    /**
     * Editor's version
     */
    version?: string;

    /**
     * Timestamp of saving in milliseconds
     */
    time?: number;

    /**
     * Saved Blocks
     */
    blocks: OutputBlockData[];
  }

  interface parser {
    parse(dataBlocks: OutputData): string[];
    parseBlock(dataBlock: OutputBlockData): string;
  }

  export default function (): parser;
}
