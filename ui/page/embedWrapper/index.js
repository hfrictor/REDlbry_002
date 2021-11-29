import { connect } from 'react-redux';
import EmbedWrapperPage from './view';
import { makeSelectClaimForUri, selectIsUriResolving } from 'redux/selectors/claims';
import { makeSelectStreamingUrlForUri } from 'redux/selectors/file_info';
import { doResolveUri } from 'redux/actions/claims';
import { buildURI } from 'util/lbryURI';
import { doPlayUri } from 'redux/actions/content';
import { selectCostInfoForUri, doFetchCostInfoForUri, selectBlackListedOutpoints } from 'lbryinc';

const select = (state, props) => {
  const { match } = props;
  const { params } = match;
  const { claimName, claimId } = params;
  const uri = claimName ? buildURI({ claimName, claimId }) : '';
  return {
    uri,
    claim: makeSelectClaimForUri(uri)(state),
    costInfo: selectCostInfoForUri(state, uri),
    streamingUrl: makeSelectStreamingUrlForUri(uri)(state),
    isResolvingUri: selectIsUriResolving(state, uri),
    blackListedOutpoints: selectBlackListedOutpoints(state),
  };
};

const perform = (dispatch) => {
  return {
    resolveUri: (uri) => dispatch(doResolveUri(uri)),
    doPlayUri: (uri) => dispatch(doPlayUri(uri)),
    doFetchCostInfoForUri: (uri) => dispatch(doFetchCostInfoForUri(uri)),
  };
};

export default connect(select, perform)(EmbedWrapperPage);
