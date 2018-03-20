import { JsonController, Get, Post, HttpCode, Body, Param, Put, NotFoundError, Authorized, CurrentUser} from "routing-controllers";
import Game from "./entity";
import { createGame } from "./logic";
import User from "../users/entity";
import { io } from "../index";

@JsonController()
export default class GameController {


  @Authorized()
  @Put("/games/:id/join")
  async updateGame(
    @CurrentUser() user: User,
    @Param("id") id: number,
    @Body() update: Partial<Game>
  ) {
    const userId = { userid_to_player2: user.id };
    const game = await Game.findOneById(id);
    if (!game) throw new NotFoundError("Cannot find game");

    Game.merge(game, update, userId).save();
    return {
      message: `The player with id ${
        userId.userid_to_player2
      } joined the game ${id}`
    };
  }

  @Authorized()
  @Put("/games/:id")
  async update(
    @CurrentUser() user: User,
    @Param("id") id: number,
    @Body() cardId,
    @Body() update: Partial<Game>
  ) {

    const game = await Game.findOneById(id);
    if (!game) throw new NotFoundError("Cannot find game");

    if (game) {
      if (user.id === game.userid_to_player1 ){
      game.player1 =  game.player1.filter(item => {
        return item != game.active })
      } else if (user.id ===game.userid_to_player2) {
      game.player2 = game.player2.filter(item => {
          return item != game.active})
      }
    }
  

      game.active = cardId.cardId
      Game.merge(game, update).save();


      return {
       active: game.active,
       card_on_hand: game.player1
     }






  }

  @Authorized()
  @Get("/games/:id")
  async getGame(
    @Param("id") id: number,
    @CurrentUser() user: User) {
    const userId = user.id;
    const game = await Game.findOneById(id);
    if (game) {
      if (userId === Number(game.userid_to_player1)) {
        return {
          active: game.active,
          card_on_hand: game.player1
        };
      } else if (userId === Number(game.userid_to_player2)) {
        return {
          active: game.active,
          card_on_hand: game.player2
        };
      } else {
        return { message: "You are not playing at this game, get out" };
      }
    } else {
      return { message: "user not found" };
    }
  }

  @Authorized()
  @Get("/games")
  async allGame() {
    const games = await Game.find();
    games.sort(function(a, b) {
      return a.id - b.id;
    });
    const new_games = games.map(game => {
      return {
        id: game.id,
        player1: game.userid_to_player1,
        player2: game.userid_to_player2
      };
    });
    return new_games;
  }

  @Authorized()
  @Post("/games")
  @HttpCode(201)
  async create(
    @CurrentUser() user: User) {
    const userId = { userId: user.id };
    const game = await createGame(userId).save();

    const games = await Game.find();
    games.sort(function(a, b) {
      return a.id - b.id;
    });
    const new_games = games.map(game => {
      return {
        id: game.id,
        player1: game.userid_to_player1,
        player2: game.userid_to_player2
      };
    });

    io.emit("action", {
      type: "FETCH_GAMES",
      payload: new_games
    });

    return {
      id: game.id
    };
  }
}
