
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, PlusCircle, Loader2 } from 'lucide-react';
import { getBrokerConnections, syncConnector } from '@/lib/api';
import type { BrokerConnection } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';


export default function BrokerPage() {
  const [connections, setConnections] = React.useState<BrokerConnection[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [syncing, setSyncing] = React.useState<string | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchConnections = async () => {
        setIsLoading(true);
        try {
            const data = await getBrokerConnections();
            setConnections(data);
        } catch (error) {
             toast({
                title: "Error",
                description: "Could not fetch broker connections.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };
    fetchConnections();
  }, [toast]);

  const handleSyncNow = async (connectorName: string) => {
    setSyncing(connectorName);
    try {
        const updatedConnection = await syncConnector(connectorName);
        setConnections(prevConnections => 
            prevConnections.map(conn => 
                conn.name === connectorName ? updatedConnection : conn
            )
        );
        toast({
            title: "Sync Successful",
            description: `Successfully synchronized with ${connectorName}.`
        });
    } catch (error) {
        toast({
            title: "Sync Failed",
            description: `Could not sync with ${connectorName}.`,
            variant: "destructive"
        });
    } finally {
        setSyncing(null);
    }
  }


  const getStatusVisuals = (status: string) => {
    switch (status) {
      case 'Active':
        return { 
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          badge: <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Active</Badge>
        };
      case 'Inactive':
        return { 
          icon: <XCircle className="h-5 w-5 text-gray-500" />,
          badge: <Badge variant="secondary">Inactive</Badge>
        };
      case 'Error':
        return { 
          icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
          badge: <Badge variant="destructive">Error</Badge>
        };
      default:
        return { 
          icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
          badge: <Badge variant="outline">{status}</Badge>
        };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Metadata Broker Status</h1>
          <p className="text-muted-foreground">
            Monitor connections and synchronization with KKKS data sources.
          </p>
        </div>
        <Button asChild>
          <Link href="/broker/register">
            <PlusCircle className="mr-2 h-4 w-4" />
            Register Connector
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>KKKS Connections</CardTitle>
          <CardDescription>
            Overview of all configured data source connections.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {connections.map((conn) => {
                const { icon, badge } = getStatusVisuals(conn.status);
                const isSyncing = syncing === conn.name;
                return (
                  <Card key={conn.name} className="flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-lg font-medium">{conn.name}</CardTitle>
                      {icon}
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Status</span>
                        {badge}
                      </div>
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-muted-foreground">Last Sync</span>
                        <span>{conn.lastSync}</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleSyncNow(conn.name)}
                        disabled={isSyncing}
                      >
                        {isSyncing ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="mr-2 h-4 w-4" />
                        )}
                        {isSyncing ? 'Syncing...' : 'Sync Now'}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
