jQuery(() => {
  const style =
    '<link rel="stylesheet" href="https://solid-nakazawa.github.io/addSeisanLink.css">';
  jQuery("head link:last").after(style);

  const rakus_button = document.createElement("div");
  rakus_button.id = "rakus_button";
  rakus_button.innerHTML =
    '<a href="https://rsalto.rakurakuseisan.jp/SHNuSeM1pWa/" target="_blank"><div id="rakus_link">楽楽精算</div></a>';
  const rakus_parent = document.getElementsByClassName(
    "header_right_area_grn"
  )[0];
  rakus_parent.insertBefore(rakus_button, rakus_parent.firstChild);
});
