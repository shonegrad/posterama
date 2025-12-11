
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({ error, errorInfo });
    }

    private handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background text-foreground">
                    <Card className="w-full max-w-md border-destructive/50 shadow-lg">
                        <CardHeader className="text-center">
                            <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit mb-4">
                                <AlertTriangle className="h-8 w-8 text-destructive" />
                            </div>
                            <CardTitle className="text-xl text-destructive">Something went wrong</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground text-center">
                                An unexpected error occurred while rendering this component.
                            </p>
                            {this.state.error && (
                                <div className="bg-muted/50 p-3 rounded-md overflow-x-auto">
                                    <pre className="text-xs text-destructive font-mono whitespace-pre-wrap break-all">
                                        {this.state.error.toString()}
                                    </pre>
                                    {this.state.errorInfo && (
                                        <details className="mt-2 text-xs text-muted-foreground">
                                            <summary className="cursor-pointer hover:text-foreground">Stack Trace</summary>
                                            <pre className="mt-2 whitespace-pre overflow-x-auto">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="justify-center">
                            <Button onClick={this.handleReload} variant="default" className="gap-2">
                                <RefreshCcw className="h-4 w-4" />
                                Reload Application
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}
