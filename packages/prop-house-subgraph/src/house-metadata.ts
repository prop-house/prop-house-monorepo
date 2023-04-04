import { json, Bytes, dataSource } from '@graphprotocol/graph-ts';
import { HouseMetadata } from '../generated/schema';

export function handleHouseMetadata(content: Bytes): void {
  const houseMetadata = new HouseMetadata(dataSource.stringParam());
  const value = json.fromBytes(content).toObject();
  if (value) {
    const name = value.get('name');
    const description = value.get('description');
    const imageURI = value.get('image');

    if (name && imageURI && description) {
      houseMetadata.name = name.toString();
      houseMetadata.description = description.toString();
      houseMetadata.imageURI = imageURI.toString();
    }
    houseMetadata.save();
  }
}
