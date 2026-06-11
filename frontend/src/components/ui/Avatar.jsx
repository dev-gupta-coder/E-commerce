const Avatar = ({ name = "", src, size = "md" }) => {
  const s = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-base" }[size];
  return src
    ? <img src={src} alt={name} className={`${s} rounded-full object-cover`} />
    : <div className={`${s} rounded-full bg-primary text-white flex items-center justify-center font-semibold`}>{name.charAt(0).toUpperCase()}</div>;
};
export default Avatar;
