jQuery(() => {
  const style =
    '<link rel="stylesheet" href="https://solid-nakazawa.github.io/addScheduleLink.css">';
  jQuery("head link:last").after(style);

  const selected_schedule_button = document.createElement("div");
  selected_schedule_button.id = "selected_schedule_button";
  selected_schedule_button.innerHTML =
    '<a href="/cgi-bin/cbgrn/grn.exe/schedule/index?gid=m78" target="_blank"><div id="selected_schedule_link">選択スケジュール</div></a>';
  const selected_schedule_parent = document.getElementsByClassName(
    "header_right_area_grn"
  )[0];
  selected_schedule_parent.insertBefore(
    selected_schedule_button,
    selected_schedule_parent.firstChild
  );
});
