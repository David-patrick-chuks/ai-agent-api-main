import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IDeployment {
  type: string; // e.g., whatsapp, telegram, iframe, link
  config: any;
  status: string;
  deployedAt?: Date;
}

export interface IAgent extends Document {
  agentId: string;
  ownerId: string;
  avatar:string;
  name: string;
  description: string;
  website: string;
  industry: string;
  target_audience?: string;
  goal?: string;
  tone: string; 
  role: string;  
  do_not_answer_from_general_knowledge: boolean;
  platforms: string[];
  status: string;
  deployments: IDeployment[];
}

const DeploymentSchema = new Schema<IDeployment>({
  type: { type: String, required: true },
  config: { type: Schema.Types.Mixed, required: true },
  status: { type: String, default: 'inactive' },
  deployedAt: { type: Date },
});

const AgentSchema = new Schema<IAgent>({
  agentId: { type: String, required: true, unique: true, default: uuidv4 },
  avatar:{type: String},
  ownerId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String , required:true},
  website:{type:String, require:true},
  industry:{type:String, required:true},
  target_audience:{type:String},
  goal:{type:String, required:true},
  tone: { 
    type: String, 
    required: true, 
    enum: ['friendly', 'professional', 'casual',"consultative", 'formal', 'enthusiastic', 'calm', 'humorous', 'serious', 'helpful', 'authoritative'],
    default: 'friendly'
  },
  role: { type: String, required: true, default:"salesRep" },
  do_not_answer_from_general_knowledge: { type: Boolean, default: true },
  platforms: [{ type: String }],
  status: { type: String, default: 'inactive' },
  deployments: [DeploymentSchema],
}, { timestamps: true });

export default mongoose.model<IAgent>('Agent', AgentSchema);  