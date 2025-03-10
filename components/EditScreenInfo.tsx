import { StyleSheet, Text, View } from 'react-native';

import { useBearStore } from 'store/store';
import { Button } from './Button';

export default function EditScreenInfo({ path }: { path: string }) {
  const title = 'Open up the code for this screen:';
  const description =
    'Change any of the text, save the file, and your app will automatically update.';

  return (
    <View style={styles.getStartedContainer}>
      <Text style={styles.getStartedText}>{title}</Text>
      <View style={[styles.codeHighlightContainer, styles.homeScreenFilename]}>
        <Text>{path}</Text>
      </View>
      <Text style={styles.getStartedText}>{description}</Text>
      <Text style={styles.getStartedText}>
        This is the number of bears: {useBearStore((state) => state.bears)}
      </Text>
      <Button
        title="Increase Population"
        onPress={() => useBearStore.getState().increasePopulation()}
      />
      <Button title="Remove All Bears" onPress={() => useBearStore.getState().removeAllBears()} />
      <Button title="Update Bears" onPress={() => useBearStore.getState().updateBears(12)} />
    </View>
  );
}

const styles = StyleSheet.create({
  codeHighlightContainer: {
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  getStartedText: {
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
  },
  helpContainer: {
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 15,
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    textAlign: 'center',
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
});
