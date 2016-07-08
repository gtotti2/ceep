
var $button = document.querySelector("#mudaLayout");
var $mural = document.querySelector(".mural");
var $remove = document.querySelectorAll(".cartao-fecha");
var $edits = document.querySelectorAll(".edit");


$button.addEventListener("click", function(){
	$mural.classList.toggle("mural--linhas");
if( $mural.classList.contains("mural--linhas") ){
	this.textContent = "Blocos";	
} else {
	this.textContent = "Linhas";
}	
});

// for(var i = 0; i < $remove.length; i++){
// 	$remove[i].addEventListener("click", function(e){
// 		e.preventDefault();
// 		var refId = this.getAttribute("data-id");
// 	    var $cartao = document.querySelector("#cartao_" + refId);
// 		//var $cartao = document.getElementById(refId);
// 		console.log($cartao);
// 		$cartao.classList.add("cartao--some");
// 		setTimeout(function(){
// 			$cartao.remove();
// 	 	},1000);
// 	})
// };







var $novoCartaoSalvar = document.querySelector(".novoCartao-salvar");
var contador = $(".cartao").length;

function validaCartao(e){
	
	var $cartaoConteudo = document.querySelector(".novoCartao-conteudo");
	var $errorSpan = document.querySelector(".novoCartao-conteudo + span");

	var $campoConteudo = $(".novoCartao-conteudo");
	var $conteudo = $campoConteudo.val().trim().replace(/\n/g, "<br />");
	
	if($conteudo){
		controladorCartao.add($conteudo, "#fff")
	}
	e.preventDefault();
	if(!$cartaoConteudo.value){
		e.preventDefault();
		
		if(!$errorSpan){
			var $error = document.createElement("span");
			$error.textContent = "Digite o conteúdo do cartão";
			$error.classList.add("error");
			this.parentNode.insertBefore($error,this);
		}
	}  else {
		if($errorSpan){
			$errorSpan.remove()
			}
		}



}

$novoCartaoSalvar.addEventListener("click", validaCartao)


// $("#busca").on("input", function(){
// 	var busca = $(this).val().trim();

// 	if(busca.length){
// 		$(".cartao").hide().filter(function(){
// 			return $(this).find(".cartao-conteudo")
// 			.text()
// 			.match(new RegExp(busca,"i"));
// 		}).show();
// 	}else{
// 		$(".cartao").show();
// 		}
// 	});


document.querySelector("#busca").addEventListener("input", function(){

	var busca = this.value;
	var $cartoes = document.querySelectorAll(".cartao");

	if(busca){
		for(i = 0; i < $cartoes.length; i++){
			$cartoes[i].classList.add("cartao--some");
			if($cartoes[i].querySelector(".cartao-conteudo").textContent.match(new RegExp(busca,"i"))){
				$cartoes[i].classList.remove("cartao--some");
			}
		}		
	} else {
		for(i = 0; i < $cartoes.length; i++){
			$cartoes[i].classList.remove("cartao--some");
		}
	}
});



$("#ajuda").click(function(){
	$.getJSON("https://ceep.herokuapp.com/cartoes/instrucoes", function(res){
		res.instrucoes.forEach(function(instrucao){
			controladorCartao.add(instrucao.conteudo, instrucao.cor);
		})
	})

});

var controladorCartao = (function(){


	function decideTipoCartao($conteudo){
		var quebras = $conteudo.split("<br>").length;
		var totalDeLetras = $conteudo.replace(/<br>/g, " ").length;
		var ultimoMaior = "";
	
		$conteudo.replace(/<br>/g, " ").split(" ").forEach(function(palavra){
				if(palavra.length > ultimoMaior.length) {
					ultimoMaior = palavra;
					}
				});
		 	
		 	var tamMaior = ultimoMaior.length;
		 	var tipoCartao = "cartao--textoPequeno";
		
		if(tamMaior < 9 && quebras < 5 && totalDeLetras < 55){
			tipoCartao = "cartao--textoGrande";
		} else if(tamMaior < 12 && quebras < 6 && totalDeLetras < 75) {
		tipoCartao = "cartao--textoMedio";
		}
		return tipoCartao;
		}

		var contador = 0;

	 function adicionaCartao($conteudo,cor){

		contador++;

		
		var $opcoes = criarOpcoesCartao(contador);


		var $conteudoTag = 	$("<p>").addClass("cartao-conteudo")
									.attr("contenteditable",true)
									.on("input",editaCartaoHandler)
									.append($conteudo);

		var intervaloSync;

		function editaCartaoHandler(event){
			clearTimeout(intervaloSync);

			intervaloSync = setTimeout(function(){
				$(document).trigger("precisaSincronizar");
			}, 1000);
		}


		var $date = new Date();

		var month = $date.getMonth()+1;
		var day = $date.getDate();

		var $dateOutput = $("<p>").addClass("cartao-date").text(day + '/' + month + '/' + $date.getFullYear() );

		var hash = '#'; 
        var hexa = ['FFFFFF','45AAEE','FFAA10']; 
        hash += hexa[Math.floor(Math.random() * hexa.length)];

		var tipoCartao = decideTipoCartao($conteudo);

		$("<div>").attr("id","cartao_" + contador)
				  .addClass("cartao")
				  .addClass(tipoCartao)
				  .append($opcoes)
				  .append($dateOutput)
				  .append($conteudoTag)
				  .css("background-color", hash)
				  .prependTo(".mural");
		}

		return {
			add: adicionaCartao,
			type: decideTipoCartao,
			getContador: function () {
				return contador;
			}
		}
})();

				(function(){

				var usuario = "gtotti";

				$("#sync").click(function(event){



				var cartoes = [];
				//Extrair conteúdo do cartão
				$(".cartao").each(function(){
					var cartao={};
					cartao.conteudo = $(this).find(".cartao-conteudo").html();
					cartoes.push(cartao);
				});

				var mural = {
					usuario: usuario,
					cartoes: cartoes
				}

					$.ajax({
						url: "https://ceep.herokuapp.com/cartoes/salvar",
						method: "POST",
						data: mural,
						success: function(res){
							console.log(res.quantidade + " cartoes salvos em " + res.usuario);
							$("#sync").html("Atualizando...");
							$("#sync").toggleClass("botaoSync--sincronizado");
							setTimeout(function(){
								$("#sync").html("Sincroniza");
								$("#sync").toggleClass("botaoSync--sincronizado");
							},3000);
						},
						error: function(error){
							console.log("Não foi possível salvar o mural");
							$("#sync").addClass("botaoSync--error");
						}
					});
				});

				$.getJSON("https://ceep.herokuapp.com/cartoes/carregar?callback=?",
					{usuario: usuario},
					function(res){
						var cartoes = res.cartoes;
						console.log(cartoes.length + " cartões carregados em " + res.usuario);
						cartoes.forEach(function(cartao){
							controladorCartao.add(cartao.conteudo);
						});
					}
				);

			})();


			
var criarOpcoesCartao = (function(){


	function removeCartao(e){
		e.preventDefault();
		console.log(this)
		var $cartao = document.querySelector("#cartao_" + this.getAttribute("data-id"));
		console.log("#cartao_" + this.getAttribute("data-id"))
		$cartao.classList.add("cartao--some");
		setTimeout(function(){
			$cartao.remove();
		},400);
		
		}

		for(var i = 0; i < $remove.length; i++){
			$remove[i].addEventListener("click", removeCartao);
		}

		var editar = false;

		function toggleEdicao(){
			var cartao = $("#cartao_" + this.getAttribute("data-id"));
			var $conteudo = cartao.find(".cartao-conteudo");


			if(editar){
				var editar = false;
				$conteudo.attr("contenteditable",false);
				$conteudo.blur();
			} else {
				var editar = true;
				$conteudo.attr("contenteditable",true);
				$conteudo.focus();
			}
		}


		// function toggleEdicao(e){
		// var $mural = document.querySelector(".mural");
		// var $contents = document.querySelectorAll(".cartao-conteudo");

		// $mural.addEventListener("click", function(event){

		// 	var $origem = event.target;

		// 	if($origem.classList.contains("cartao-edita")){

		// 		var max = $contents.length;
		// 		while(max--){
		// 			$contents[max].setAttribute("contenteditable",false);
		// 		}
		// 		$origem.parentNode.parentNode.querySelector(".cartao-conteudo").setAttribute("contenteditable",true);
		// 	}
		// });
		// }

		return function(idNovoCartao){
			var botaoRemove = $("<a>").addClass("cartao-fecha")
										   .addClass("opcoesDoCartao-opcao")
										   .attr("data-id", idNovoCartao)
										   .text("X")
										   .click(removeCartao);

			var botaoEdita = $("<a>").addClass("cartao-edita")
										   .addClass("opcoesDoCartao-opcao")
										   .attr("data-id", idNovoCartao)
										   .text("E")
										   .click(toggleEdicao);
			
			var opcoes = $("<div>").addClass("opcoesDoCartao").append(botaoRemove).append(botaoEdita);

			return opcoes;
		}

})();
				







