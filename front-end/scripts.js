// function getNext(id){
//   $.ajax({
//     url: `http://localhost:3000/sequences/${i}`
//   }).done(function(data){
//     console.log(data);
//     $("#sequences").append(`<li>${data.data}</li>`)
//   });
// }


$(document).ready(function(){
  console.log("ready");
  $("#get-sequence").click(function(){
    $.ajax({
      url:"http://localhost:3000/sequences"
    }).done(function(data){
      console.log(data);
      data.forEach(function(sequence){
        $("#sequences").append(`<li>${sequence.data}</li>`)
      });
    });
  });
});
