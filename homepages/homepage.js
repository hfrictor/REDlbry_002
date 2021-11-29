import * as PAGES from '../ui/constants/pages';
import * as CS from '../ui/constants/claim_search';

const YOUTUBER_CHANNEL_IDS = [
    'fb364ef587872515f545a5b4b3182b58073f230f',
    '589276465a23c589801d874f484cc39f307d7ec7',
    'ba79c80788a9e1751e49ad401f5692d86f73a2db',
    'b6e207c5f8c58e7c8362cd05a1501bf2f5b694f2',

  ];

  const YOUTUBERS = {
      ids: YOUTUBER_CHANNEL_IDS,
      link: `/$/${PAGES.DISCOVER}?${CS.CLAIM_TYPE}=${CS.CLAIM_STREAM}&${CS.CHANNEL_IDS_KEY}=${YOUTUBER_CHANNEL_IDS.join(
        ','
      )}`,
      name: 'general',
      label: 'CableTube Escape Artists',
      channelLimit: 1,
      daysOfContent: 30,
      pageSize: 24,
      //pinnedUrls: [],
      //mixIn: [],
  };

module.exports = { YOUTUBERS };
