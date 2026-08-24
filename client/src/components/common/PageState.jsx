import {
  EmptyState,
  Loader,
  Skeleton,
} from "../ui";

const PageState = (props) => {
  return <EmptyState {...props} />;
};

export default PageState;

// Optional named exports for convenience
export {
  EmptyState,
  Loader,
  Skeleton,
};