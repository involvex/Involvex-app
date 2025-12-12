import type {
  APIApplicationCommandInteraction,
  APIAutocompleteInteraction,
  APIInteraction,
  APIInteractionResponse,
  APIMessageCommandInteraction,
  APIMessageComponentInteraction,
  APIModalSubmitInteraction,
  APIPingInteraction,
  APIUserCommandInteraction,
} from "discord-api-types/v10";

type Interaction =
  | APIInteraction
  | APIApplicationCommandInteraction
  | APIMessageComponentInteraction
  | APIModalSubmitInteraction
  | APIPingInteraction
  | APIAutocompleteInteraction
  | APIUserCommandInteraction
  | APIMessageCommandInteraction;

type CommandInteraction =
  | APIApplicationCommandInteraction
  | APIUserCommandInteraction
  | APIMessageCommandInteraction;

type InteractionResponse = APIInteractionResponse;

type AutocompleteInteraction = APIAutocompleteInteraction;

type ModalSubmitInteraction = APIModalSubmitInteraction;

type MessageComponentInteraction = APIMessageComponentInteraction;

export type Env = Record<string, string | undefined>;
export type envtype = Env;
