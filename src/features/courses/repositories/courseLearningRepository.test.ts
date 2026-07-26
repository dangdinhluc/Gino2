import { strict as assert } from 'node:assert';
import { mapVocabularyProgress } from './courseLearningRepository';

assert.equal(mapVocabularyProgress('mastered'), 'remembered');
assert.equal(mapVocabularyProgress('learning'), 'learning');
assert.equal(mapVocabularyProgress('new'), 'new');
assert.equal(mapVocabularyProgress(undefined), 'new');
