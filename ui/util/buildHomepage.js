// @flow
import * as PAGES from 'constants/pages';
import * as ICONS from 'constants/icons';
import * as CS from 'constants/claim_search';
import { parseURI } from 'util/lbryURI';
import moment from 'moment';
import { toCapitalCase } from 'util/string';
import { useIsLargeScreen } from 'effects/use-screensize';
import { CUSTOM_HOMEPAGE } from 'config';



export type RowDataItem = {
  title: any,
  link?: string,
  help?: any,
  icon?: string,
  extra?: any,
  options?: {
    channelIds?: Array<string>,
    pageSize?: number,
    limitClaimsPerChannel?: number,
  },
  route?: string,
  hideForUnauth?: boolean,
};

export type HomepageCat = {
  name: string,
  icon: string,
  label: string,
  channelIds?: Array<string>,
  daysOfContent?: number,
  channelLimit?: string,
  pageSize?: number,
  claimType?: string,
  order?: string,
  tags?: Array<string>,
  pinnedUrls?: Array<string>,
  mixIn?: Array<string>,
};

// type HomepageData = {
//   [string]: {
//     [string]: HomepageCat,
//   },
// };

function getLimitPerChannel(size, isChannel) {
  if (isChannel) {
    return 1;
  } else {
    return size < 250 ? (size < 150 ? 3 : 2) : 1;
  }
}

export function getAllIds(all: any) {
  const idsSet: Set<string> = new Set();
  (Object.values(all): any).forEach((cat) => {
    if (cat.channelIds) {
      cat.channelIds.forEach((id) => idsSet.add(id));
    }
  });
  // $FlowFixMe
  return Array.from(idsSet);
}

export const getHomepageRowForCat = (cat: HomepageCat) => {
  let orderValue;
  switch (cat.order) {
    case 'trending':
      orderValue = CS.ORDER_BY_TRENDING_VALUE;
      break;
    case 'top':
      orderValue = CS.ORDER_BY_TOP_VALUE;
      break;
    case 'new':
      orderValue = CS.ORDER_BY_NEW_VALUE;
      break;
    default:
      orderValue = CS.ORDER_BY_TRENDING_VALUE;
  }

  let urlParams = new URLSearchParams();
  if (cat.claimType) {
    urlParams.set(CS.CLAIM_TYPE, cat.claimType);
  }
  if (cat.channelIds) {
    urlParams.set(CS.CHANNEL_IDS_KEY, cat.channelIds.join(','));
  }

  const isChannelType = cat.claimType && cat.claimType === 'channel';

  // can intend no limit, numerica auto limit, specific limit.
  let limitClaims;
  if (typeof cat.channelLimit === 'string' && cat.channelIds && cat.channelIds.length) {
    if (cat.channelLimit === 'auto') {
      limitClaims = getLimitPerChannel(cat.channelIds.length, isChannelType);
    } else if (cat.channelLimit) {
      const limitNumber = Number(cat.channelLimit);
      // eslint-disable-next-line
      if (limitNumber === limitNumber && limitNumber !== 0) {
        // because javascript and NaN !== NaN
        limitClaims = Math.floor(limitNumber);
      }
    }
  }

  return {
    link: `/$/${PAGES.DISCOVER}?${urlParams.toString()}`,
    route: cat.name ? `/$/${cat.name}` : undefined,
    icon: cat.icon || '', // some default
    title: cat.label,
    pinnedUrls: cat.pinnedUrls,
    options: {
      claimType: cat.claimType || ['stream', 'repost'],
      channelIds: cat.channelIds,
      orderBy: orderValue,
      pageSize: cat.pageSize || undefined,
      limitClaimsPerChannel: limitClaims,
      releaseTime: `>${Math.floor(
        moment()
          .subtract(cat.daysOfContent || 30, 'days')
          .startOf('week')
          .unix()
      )}`,
    },
  };
};

export function GetLinksData(
  all: any, // HomepageData type?
  isHomepage?: boolean = false,
  authenticated?: boolean,
  showPersonalizedChannels?: boolean,
  showPersonalizedTags?: boolean,
  subscribedChannels?: Array<Subscription>,
  followedTags?: Array<Tag>,
  showIndividualTags?: boolean,
  showNsfw?: boolean
) {
  const isLargeScreen = useIsLargeScreen();

  function getPageSize(originalSize) {
    return isLargeScreen ? originalSize * (3 / 2) : originalSize;
  }

  // $FlowFixMe
  let rowData: Array<RowDataItem> = [];
  const individualTagDataItems: Array<RowDataItem> = [];

  if (isHomepage && showPersonalizedChannels && subscribedChannels) {
    const RECENT_FROM_FOLLOWING = {
      title: __('Recent From Following'),
      link: `/$/${PAGES.CHANNELS_FOLLOWING}`,
      icon: ICONS.SUBSCRIBE,
      options: {
        orderBy: CS.ORDER_BY_NEW_VALUE,
        releaseTime:
          subscribedChannels.length > 20
            ? `>${Math.floor(moment().subtract(9, 'months').startOf('week').unix())}`
            : `>${Math.floor(moment().subtract(1, 'year').startOf('week').unix())}`,
        pageSize: getPageSize(subscribedChannels.length > 3 ? (subscribedChannels.length > 6 ? 16 : 8) : 4),
        streamTypes: null,
        channelIds: subscribedChannels.map((subscription: Subscription) => {
          const { channelClaimId } = parseURI(subscription.uri);
          if (channelClaimId) return channelClaimId;
        }),
      },
    };
    // $FlowFixMe flow thinks this might not be Array<string>
    rowData.push(RECENT_FROM_FOLLOWING);
  }

  // **************************************************************************
  // @if CUSTOM_HOMEPAGE='false'

  const YOUTUBER_CHANNEL_IDS = [
    'fb364ef587872515f545a5b4b3182b58073f230f',
    '589276465a23c589801d874f484cc39f307d7ec7',
    'ba79c80788a9e1751e49ad401f5692d86f73a2db',
    'b6e207c5f8c58e7c8362cd05a1501bf2f5b694f2',
    ''

  ];

  const YOUTUBE_CREATOR_ROW = {
    title: __('Featured'),
    link: `/$/${PAGES.DISCOVER}?${CS.CLAIM_TYPE}=${CS.CLAIM_STREAM}&${CS.CHANNEL_IDS_KEY}=${YOUTUBER_CHANNEL_IDS.join(
      ','
    )}`,
    options: {
      claimType: ['stream'],
      orderBy: ['release_time'],
      pageSize: getPageSize(12),
      channelIds: YOUTUBER_CHANNEL_IDS,
      limitClaimsPerChannel: 1,
      releaseTime: `>${Math.floor(moment().subtract(1, 'months').startOf('week').unix())}`,
    },
  };

  const TOP_CONTENT_TODAY = {
    // title: __(''),
    // link: `/$/${PAGES.DISCOVER}?${CS.ORDER_BY_KEY}=${CS.ORDER_BY_TOP}&${CS.FRESH_KEY}=${CS.FRESH_DAY}`,
    // options: {
    //   pageSize: getPageSize(showPersonalizedChannels || showPersonalizedTags ? 4 : 8),
    //   orderBy: ['effective_amount'],
    //   claimType: ['stream'],
    //   limitClaimsPerChannel: 2,
    //   releaseTime: `>${Math.floor(moment().subtract(1, 'day').startOf('day').unix())}`,
    // },
  };

  const TOP_CHANNELS = {
    title: __('Top On REDlbry'),
    link: `/$/${PAGES.DISCOVER}?claim_type=channel&${CS.ORDER_BY_KEY}=${CS.ORDER_BY_TOP}&${CS.FRESH_KEY}=${CS.FRESH_ALL}`,
    options: {
      orderBy: ['effective_amount'],
      claimType: ['channel'],
    },
  };

  const LATEST_FROM_LBRY = {
    title: __('Latest From @lbry'),
    link: `/@lbry:3f`,
    options: {
      orderBy: ['release_time'],
      pageSize: getPageSize(4),
      channelIds: ['3fda836a92faaceedfe398225fb9b2ee2ed1f01a'],
    },
  };

  if (isHomepage && !CUSTOM_HOMEPAGE) {
    if (followedTags) {
      const TRENDING_FOR_TAGS = {
        title: __('Trending For Your Tags'),
        link: `/$/${PAGES.TAGS_FOLLOWING}`,
        icon: ICONS.TAG,

        options: {
          pageSize: getPageSize(4),
          tags: followedTags.map((tag) => tag.name),
          claimType: ['stream'],
          limitClaimsPerChannel: 2,
        },
      };
      followedTags.forEach((tag: Tag) => {
        const tagName = `#${toCapitalCase(tag.name)}`;
        individualTagDataItems.push({
          title: __('Trending for %tagName%', { tagName: tagName }),
          link: `/$/${PAGES.DISCOVER}?t=${tag.name}`,
          options: {
            pageSize: 4,
            tags: [tag.name],
            claimType: ['stream'],
          },
        });
      });
      if (showPersonalizedTags && !showIndividualTags) rowData.push(TRENDING_FOR_TAGS);
      if (showPersonalizedTags && showIndividualTags) {
        individualTagDataItems.forEach((item: RowDataItem) => {
          rowData.push(item);
        });
      }
    }
  }

  if (!CUSTOM_HOMEPAGE) {
    if (!authenticated) {
      rowData.push(YOUTUBE_CREATOR_ROW);
    }
    rowData.push(TOP_CONTENT_TODAY);
    rowData.push(LATEST_FROM_LBRY);
    if (!showPersonalizedChannels) rowData.push(TOP_CHANNELS);
  }

  // @endif
  // **************************************************************************

  // TODO: provide better method for exempting from homepage
  (Object.values(all): any)
    .filter((row) => !(isHomepage && row.name === 'news'))
    .map((row) => rowData.push(getHomepageRowForCat(row)));
  return rowData;
}
