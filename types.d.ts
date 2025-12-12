
import { APIApplicationCommandInteraction } from "discord-api-types/v10"
import { APIInteraction } from "discord-api-types/v10"
import { APIBaseInteraction } from "discord-api-types/v10"
import { APIBaseInteraction } from "discord-api-types/v10"
import { APIInteractionResponse } from "discord-api-types/v10"
import { APIPingInteraction } from "discord-api-types/v10"
import { APIModalSubmitInteraction } from "discord-api-types/v10"
import { APIUserCommandInteraction } from "discord-api-types/v10"
import { APIAutocompleteInteraction } from "discord-api-types/v10"
import { APIMessageCommandInteraction } from "discord-api-types/v10"
import { APIMessageComponentInteraction } from "discord-api-types/v10"

type Interaction = APIInteraction | APIApplicationCommandInteraction | APIMessageComponentInteraction | APIModalSubmitInteraction | APIPingInteraction | APIAutocompleteInteraction | APIUserCommandInteraction | APIMessageCommandInteraction

type CommandInteraction = APIApplicationCommandInteraction | APIUserCommandInteraction | APIMessageCommandInteraction

type InteractionResponse = APIInteractionResponse

type AutocompleteInteraction = APIAutocompleteInteraction

type ModalSubmitInteraction = APIModalSubmitInteraction

type MessageComponentInteraction = APIMessageComponentInteraction
