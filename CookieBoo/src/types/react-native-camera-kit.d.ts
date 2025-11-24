declare module 'react-native-camera-kit' {
  import { ComponentType } from 'react';
  import { ViewProps } from 'react-native';

  export type CameraType = 'Front' | 'Back';

  export type CameraProps = ViewProps & {
    cameraType?: CameraType;
    scanBarcode?: boolean;
    showFrame?: boolean;
    laserColor?: string;
    frameColor?: string;
    onReadCode?: (event: {
      nativeEvent?: { codeStringValue?: string | null };
    }) => void;
  };

  export const Camera: ComponentType<CameraProps>;
}
