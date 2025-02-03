import PropTypes from "prop-types";

export default function LinkButton({ text, url }) {
  return (
    <a href={url} className="rounded-lg bg-zinc-800 px-4 py-2 text-white">
      {text}
    </a>
  );
}

LinkButton.propTypes = {
  text: PropTypes.string.isRequired,
  url: PropTypes.string,
};
