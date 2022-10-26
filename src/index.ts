import { formatter } from './formatter';
import validatePeerDependencies from 'validate-peer-dependencies';

validatePeerDependencies(__dirname);

// special TS syntax: https://github.com/microsoft/TypeScript/issues/2719
export = formatter;
